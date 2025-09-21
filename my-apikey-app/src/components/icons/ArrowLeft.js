export default function ArrowLeft({ className = 'w-5 h-5', ...props }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m8-14l-7 7 7 7" />
    </svg>
  );
}
