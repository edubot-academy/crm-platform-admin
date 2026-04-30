interface TenantSectionStateProps {
  message: string;
}

export function TenantSectionState({ message }: TenantSectionStateProps) {
  return <div className="py-8 text-center text-edubot-muted">{message}</div>;
}
