import { useCallback, useRef } from "react";

/**
 * Voz real pro widget da Aurora no S.P.Y.: entrada por microfone (push-to-talk, Web Speech API)
 * e saída de áudio (toca o audioBase64 que a Aurora já manda de volta). Versão enxuta do
 * useVoiceEngine.ts do jarvis-os — sem wake word e sem medidor de volume, que não fazem
 * sentido num widget de CRM que fica sempre aberto numa aba.
 */
export function useAuroraVoice(onFinalTranscript: (text: string) => void) {
  const recognitionRef = useRef<any>(null);
  const playbackRef = useRef<HTMLAudioElement | null>(null);

  const isVoiceInputSupported = () =>
    !!((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);

  const getPlaybackEl = useCallback(() => {
    if (!playbackRef.current) playbackRef.current = new Audio();
    return playbackRef.current;
  }, []);

  /**
   * Política de autoplay do navegador só libera <audio>.play() dentro de um gesto do usuário.
   * A resposta da Aurora chega async, bem depois do clique — então "destravamos" o áudio aqui,
   * no próprio clique do microfone, com um play+pause mudo e silencioso.
   */
  const primeAudio = useCallback(() => {
    const el = getPlaybackEl();
    const wasMuted = el.muted;
    el.muted = true;
    el.src = "data:audio/mpeg;base64,//uQxAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAACAAACcQCA";
    void el
      .play()
      .catch(() => undefined)
      .finally(() => {
        el.pause();
        el.muted = wasMuted;
      });
  }, [getPlaybackEl]);

  const stopPushToTalk = useCallback(() => {
    recognitionRef.current?.stop();
  }, []);

  const startPushToTalk = useCallback(
    (onStart: () => void, onEnd: () => void, onInterim: (text: string) => void) => {
      const Ctor = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!Ctor) return;

      primeAudio();

      if (recognitionRef.current) recognitionRef.current.stop();

      const recognition = new Ctor();
      recognition.lang = "pt-BR";
      recognition.continuous = false;
      recognition.interimResults = true;

      recognition.onstart = () => onStart();

      recognition.onresult = (event: any) => {
        let finalText = "";
        let interim = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          if (result.isFinal) finalText += result[0].transcript;
          else interim += result[0].transcript;
        }
        onInterim(interim);
        if (finalText.trim()) onFinalTranscript(finalText.trim());
      };

      recognition.onerror = () => onEnd();
      recognition.onend = () => onEnd();

      recognitionRef.current = recognition;
      recognition.start();
    },
    [onFinalTranscript, primeAudio]
  );

  const playAudioBase64 = useCallback(
    (base64: string, onStart: () => void, onEnd: () => void) => {
      if (!base64) return;
      const el = getPlaybackEl();
      el.muted = false;
      el.onplay = onStart;
      el.onended = onEnd;
      el.onerror = onEnd;
      el.src = `data:audio/mpeg;base64,${base64}`;
      void el.play().catch(() => onEnd());
    },
    [getPlaybackEl]
  );

  return { isVoiceInputSupported, startPushToTalk, stopPushToTalk, playAudioBase64, primeAudio };
}
