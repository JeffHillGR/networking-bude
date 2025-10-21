import { ArrowLeft } from 'lucide-react';

function ArchivePage({ onBackToDashboard }) {

  const archivedContent = [
    {
      id: 1,
      title: "Building Meaningful Professional Networks",
      description: "Learn strategies for authentic networking that leads to lasting professional relationships.",
      date: "September 15, 2024",
      category: "Networking"
    },
    {
      id: 2,
      title: "Mastering the Virtual Coffee Chat",
      description: "Best practices for making virtual meetings as impactful as in-person connections.",
      date: "August 22, 2024",
      category: "Communication"
    },
    {
      id: 3,
      title: "Personal Branding in the Digital Age",
      description: "How to present your authentic professional self across digital platforms.",
      date: "July 10, 2024",
      category: "Personal Development"
    },
    {
      id: 4,
      title: "The Art of Following Up",
      description: "Turn initial connections into meaningful professional relationships.",
      date: "June 5, 2024",
      category: "Networking"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-8">
        {/* Back to Dashboard Button */}
        <button
          onClick={onBackToDashboard}
          className="flex items-center gap-2 text-[#009900] hover:text-[#007700] font-medium mb-4 md:mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Dashboard</span>
        </button>
        <div className="text-center">
          <div className="inline-block bg-white px-6 py-3 rounded-lg mb-3 border-2 border-black">
            <h1 className="text-3xl font-bold text-black">Content Archive</h1>
          </div>
          <p className="text-gray-600 mt-2">Browse our collection of professional development content</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">

        <div className="grid md:grid-cols-2 gap-6">
          {archivedContent.map((item) => (
            <div key={item.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <span className="inline-block bg-[#D0ED00]/20 text-[#009900] text-xs px-2 py-1 rounded font-medium">
                  {item.category}
                </span>
                <span className="text-sm text-gray-500">{item.date}</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{item.title}</h3>
              <p className="text-gray-600 mb-4">{item.description}</p>
              <button
                onClick={() => alert('Full content coming soon! This feature will be available after beta testing.')}
                className="text-[#009900] hover:text-[#007700] font-medium text-sm"
              >
                Read More →
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ArchivePage;