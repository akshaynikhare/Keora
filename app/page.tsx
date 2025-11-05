export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center space-y-8">
          <div className="space-y-4">
            <h1 className="font-serif text-5xl md:text-7xl font-bold text-slate-800">
              Keora
            </h1>
            <p className="text-2xl md:text-3xl text-primary-600 font-medium">
              Where Families Connect
            </p>
          </div>

          <div className="max-w-2xl mx-auto space-y-6">
            <p className="text-lg text-slate-600">
              Build verified family trees, connect with relatives through mutual approval,
              and share your heritage seamlessly.
            </p>

            <div className="grid md:grid-cols-3 gap-6 mt-12">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="text-4xl mb-3">🌳</div>
                <h3 className="font-semibold text-lg mb-2">Build Your Tree</h3>
                <p className="text-slate-600 text-sm">
                  Create and visualize your family tree with an intuitive interface
                </p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="text-4xl mb-3">🤝</div>
                <h3 className="font-semibold text-lg mb-2">Connect Safely</h3>
                <p className="text-slate-600 text-sm">
                  Find and link with relatives through verified mutual approval
                </p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="text-4xl mb-3">🔒</div>
                <h3 className="font-semibold text-lg mb-2">Privacy First</h3>
                <p className="text-slate-600 text-sm">
                  Control who sees your information with granular privacy settings
                </p>
              </div>
            </div>

            <div className="flex gap-4 justify-center mt-8">
              <button className="bg-primary hover:bg-primary-600 text-white px-8 py-3 rounded-lg font-medium transition-colors">
                Get Started
              </button>
              <button className="bg-white hover:bg-slate-50 text-slate-700 px-8 py-3 rounded-lg font-medium border border-slate-300 transition-colors">
                Learn More
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
