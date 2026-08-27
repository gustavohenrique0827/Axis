console.log('start', Date.now());
import('@supabase/auth-js').then(() => console.log('OK', Date.now())).catch(e => console.log('ERR', e.message));
