// --- SES YÖNETİM SİSTEMİ ---
export const useSoundEffects = () => {
  const playSound = (type) => {
    const sounds = {
      move: '/sounds/move.wav',
      select: '/sounds/select.wav',
      back: '/sounds/back.wav',
      error: '/sounds/error.wav',
    };

    const audio = new Audio(sounds[type]);
    audio.volume = 0.3; // Sesi biraz kısık tutalım ki rahatsız etmesin
    audio.play().catch(() => {
      // Tarayıcı bazen etkileşim olmadan ses oynatılmasına izin vermez
      console.log("Ses oynatılamadı: Kullanıcı etkileşimi bekleniyor.");
    });
  };

  return { playSound };
};