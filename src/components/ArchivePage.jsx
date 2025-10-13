import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

function ArchivePage() {
  const navigate = useNavigate();

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
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 px-4 py-2 bg-[#009900] text-white rounded-lg font-medium hover:bg-[#007700] transition-colors border-[3px] border-[#D0ED00] mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Dashboard
        </button>

        <h1 className="text-3xl font-bold text-gray-900 mb-2">Content Archive</h1>
        <p className="text-gray-600 mb-8">Browse our collection of professional development content</p>

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