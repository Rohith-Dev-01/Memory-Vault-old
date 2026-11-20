export function EmptyState({ icon, title, message, action }: { icon: React.ReactNode; title: string; message: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-6">
      <div className="w-14 h-14 rounded-2xl bg-sand flex items-center justify-center text-secondary-text mb-4">{icon}</div>
      <h3 className="text-lg text-primary-text">{title}</h3>
      <p className="text-sm text-secondary-text mt-1.5 max-w-sm">{message}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
