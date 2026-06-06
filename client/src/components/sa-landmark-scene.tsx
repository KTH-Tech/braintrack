import heroImage from "@assets/image_(13)_1776600771897.png";

interface SALandmarkSceneProps {
  className?: string;
}

export function SALandmarkScene({ className = "" }: SALandmarkSceneProps) {
  return (
    <div
      className={`sa-landmark-scene pointer-events-none select-none ${className}`}
      aria-hidden="true"
      data-testid="sa-landmark-scene"
    >
      <img
        src={heroImage}
        alt=""
        className="w-full h-full object-cover object-bottom"
        draggable={false}
      />
    </div>
  );
}
