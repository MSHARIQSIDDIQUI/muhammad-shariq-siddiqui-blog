// Reusable ad placeholder. Swap the inner div for your ad network's script/embed
// (e.g. Google AdSense <ins class="adsbygoogle"> tag) once you're approved.
// Keeping a fixed size here prevents layout shift once real ads load.
export default function AdSlot({ size = 'leaderboard', label = 'Advertisement' }) {
  const dimensions = {
    leaderboard: { width: '100%', height: '90px', maxWidth: '728px' },
    rectangle: { width: '100%', height: '250px', maxWidth: '300px' },
    banner: { width: '100%', height: '100px', maxWidth: '100%' },
  }[size];

  return (
    <div className="ad-slot" style={{ maxWidth: dimensions.maxWidth }}>
      <span className="ad-slot-label">{label}</span>
      <div className="ad-slot-box" style={{ height: dimensions.height }}>
        {/* Replace this div's content with your ad network's embed code */}
        <span>Ad space — {size}</span>
      </div>
    </div>
  );
}
