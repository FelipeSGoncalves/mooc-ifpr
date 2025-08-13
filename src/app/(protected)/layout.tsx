const ProtectedLayout = ({children}: {children: React.ReactNode}) => {
  return (
    <div>
      <h1>Protected Area</h1>
      {children}
    </div>
  );
}

export default ProtectedLayout;
