export function InputError({ id, message }: {
  id: string,
  message: string | undefined
}) {
  if (!message) return;
  return (
    <p
      id={id}
      aria-live={"polite"}
      aria-atomic={"true"}
      className={"mt-1 text-xs text-red-600 font-medium"}
    >
      {message}
    </p>
  );
}