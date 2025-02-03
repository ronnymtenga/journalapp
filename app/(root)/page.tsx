// pages/index.tsx
import Chat from '../components/Chat';

const Home = () => {
  return (
    <div className="min-h-screen bg-primary text-white flex flex-col">
      {/* Header Section */}
      <header className="w-full bg-secondary p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">Your Chat App</h1>
        </div>
      </header>

      {/* Main Content - Chat Section */}
      <main className="flex-grow flex justify-center items-center px-4 py-8">
        <div className="w-full max-w-2xl">
          <Chat />
        </div>
      </main>

      {/* Footer Section */}
      <footer className="w-full bg-secondary py-4 text-center">
        <p>© 2025 Your Chat App. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Home;
