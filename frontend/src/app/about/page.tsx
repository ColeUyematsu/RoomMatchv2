"use client";

import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      <h1 className="text-3xl font-bold mb-6">About RoomMatch</h1>
      <p className="text-lg max-w-3xl text-center mb-6">
        RoomMatch is a smart roommate-matching platform for first-year students. Our goal is to simplify the process of finding compatible roommates using AI-driven algorithms.
      </p>

      {/* Project Managers */}
      <h2 className="text-xl font-semibold mt-6">Project Managers:</h2>
      <ul className="mt-2">
        <li>Cole Uyematsu - 2026 - Computer Science</li>
        <li>Liam Hochman - 2026 - Computer Science</li>
        <li>Caleb Mogyabiyedom - 2026 - Economics/Data Science Minor</li>
      </ul>

      {/* Contacts */}
      <h2 className="text-xl font-semibold mt-6">Contacts:</h2>
      <ul className="mt-2">
        <li><a href="mailto:cjul2022@mymail.pomona.edu" className="text-blue-600 hover:underline">cjul2022@mymail.pomona.edu</a></li>
        <li><a href="mailto:lbhh2022@mymail.pomona.edu" className="text-blue-600 hover:underline">lbhh2022@mymail.pomona.edu</a></li>
        <li><a href="mailto:camg2022@mymail.pomona.edu" className="text-blue-600 hover:underline">camg2022@mymail.pomona.edu</a></li>
      </ul>

      {/* Team Structure */}
      <h2 className="text-xl font-semibold mt-6">Team Structure:</h2>
      <p className="mt-2">The team is divided into three groups, each focused on a specific area of development:</p>
      <ul className="mt-2">
        <li><strong>AI Team:</strong> Cole Uyematsu, Mark Wang, Arjun Sisodia</li>
        <li><strong>Data Team:</strong> Caleb Mogyabiyedom, James Zhu, Hudson Colletti, Amar Kumar, Jazzmin Duncan</li>
        <li><strong>Software Engineering Team:</strong> Liam Hochman, Catherine Liu, Alyssa Coleman</li>
      </ul>

      {/* Overview */}
      <h2 className="text-xl font-semibold mt-6">Overview:</h2>
      <p className="mt-2 max-w-3xl text-center">
        RoomMatch uses clustering algorithms like k-means and hierarchical clustering to analyze lifestyle data and recommend potential roommate matches. The goal is to foster harmonious living environments and reduce stress during the transition to college life.
      </p>
      <p className="mt-2 max-w-3xl text-center">
        We leverage advanced AI models combined with thoughtful user experience design to ensure students have a smooth and stress-free experience when finding roommates.
      </p>

      {/* Navigation */}
      <div className="mt-8">
        <Link href="/" className="text-blue-600 hover:underline mr-4">Home</Link>
        <Link href="/register" className="text-blue-600 hover:underline">Register</Link>
      </div>
    </div>
  );
}