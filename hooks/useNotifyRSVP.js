// /hooks/useNotifyRSVP.js
export async function useNotifyRSVP(nome, convidados) {
  try {
    const res = await fetch('/api/notifyRSVP', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome, convidados })
    });

    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData.error || 'Erro ao enviar notificação de RSVP');
    }

    const data = await res.json();
    console.log('Notificação enviada:', data.message);
    return data;
  } catch (err) {
    console.error('Erro no hook useNotifyRSVP:', err);
    throw err;
  }
}
