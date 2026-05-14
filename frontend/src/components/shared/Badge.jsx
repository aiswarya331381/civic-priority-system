import { sevClass, stClass, stLabel } from '../../utils/helpers';

export function SevBadge({ level }) {
  return (
    <span className={`badge ${sevClass(level)}`}>
      {level?.charAt(0).toUpperCase() + level?.slice(1)}
    </span>
  );
}

export function StatusBadge({ status }) {
  return (
    <span className={`badge ${stClass(status)}`}>
      {stLabel(status)}
    </span>
  );
}
