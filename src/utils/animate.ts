export const doDownloadCenterAnimate = (animateClass?: string) => {
  const downloadCenterEl = document.querySelector('.js-download-center');

  if (downloadCenterEl) {
    const animateCss = animateClass ?? 'animate__bounceIn';
    downloadCenterEl.classList.remove(animateCss);
    setTimeout(() => {
      downloadCenterEl.classList.add(animateCss);
    }, 200);
  }
};

export const doNewsAnimate = (animateClass?: string) => {
  const downloadCenterEl = document.querySelector('.js-news');

  if (downloadCenterEl) {
    const animateCss = animateClass ?? 'animate__bounceIn';
    downloadCenterEl.classList.remove(animateCss);
    setTimeout(() => {
      downloadCenterEl.classList.add(animateCss);
    }, 200);
  }
};
