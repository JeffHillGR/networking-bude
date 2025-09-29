export const MobileBottomNav = () => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
      <div className="flex justify-around items-center">
        <button className="text-sm">Home</button>
        <button className="text-sm">Events</button>
        <button className="text-sm">Matches</button>
        <button className="text-sm">Messages</button>
        <button className="text-sm">Profile</button>
      </div>
    </nav>
  );
};

