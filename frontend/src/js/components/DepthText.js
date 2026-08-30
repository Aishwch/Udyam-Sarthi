/* UDYAM SARTHI 3D Depth Text Component */

export const renderDepthText = () => {
  setTimeout(() => {
    const container = document.getElementById('depthTextContainer');
    if (!container) return;

    const handleMouseMove = (e) => {
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;

      const rotateX = (-y / rect.height) * 15; // Max 15 deg tilt
      const rotateY = (x / rect.width) * 15;

      container.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    };

    const handleMouseLeave = () => {
      container.style.transform = `rotateX(0deg) rotateY(0deg)`;
    };

    const wrapper = container.parentElement;
    if (wrapper) {
      wrapper.addEventListener('mousemove', handleMouseMove);
      wrapper.addEventListener('mouseleave', handleMouseLeave);
    }
  }, 0);

  return `
    <div class="depth-text-wrapper" style="position: relative;">
      <div class="depth-glow-backdrop"></div>
      <div class="depth-text-container" id="depthTextContainer">
        <div class="depth-text-line">UDYAM</div>
        <div class="depth-text-line sarthi">SARTHI</div>
      </div>
    </div>
  `;
};
