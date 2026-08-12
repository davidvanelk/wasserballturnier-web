type TeamNameProps = {
  name: string;
  isChampion: boolean;
  championLabel: string;
};

export default function TeamName({
  name,
  isChampion,
  championLabel,
}: TeamNameProps) {
  return (
    <span className="inline-flex items-center gap-2">
      {isChampion ? (
        <span
          aria-label={championLabel}
          className="text-xl leading-none"
          role="img"
          title={championLabel}
        >
          👑
        </span>
      ) : null}
      <span>{name}</span>
    </span>
  );
}
