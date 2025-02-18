export default function HomePage() {
  return (
    <main className="p-8">
      <h1 className="text-3xl font-bold">Game Development Log & Task Manager</h1>
      <p className="mt-4">
        Welcome to a Trello-like project management tool designed specifically for game developers and general project management.
      </p>
      <ul className="mt-4 list-disc ml-6">
        <li>Real-time collaboration with Supabase Realtime</li>
        <li>Customizable workflows and boards</li>
        <li>Multiple authentication methods (Email, GitHub, Discord)</li>
        <li>Integrated version control and external document support</li>
      </ul>
    </main>
  );
}