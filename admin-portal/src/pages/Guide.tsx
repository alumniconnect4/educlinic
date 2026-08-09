import { useState } from 'react';

type Tab = 'dashboard' | 'users' | 'gallery' | 'events';

export default function Guide() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');

  const tabs: { id: Tab; label: string }[] = [
    { id: 'dashboard', label: '1. Dashboard' },
    { id: 'users', label: '2. Manage Users' },
    { id: 'gallery', label: '3. Gallery' },
    { id: 'events', label: '4. Events' },
  ];

  return (
    <div className="p-8 md:p-12 max-w-7xl mx-auto w-full animate-in fade-in duration-300 bg-white min-h-screen border-x border-slate-200">
      <div className="mb-12 border-b border-slate-200 pb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold text-slate-900 tracking-tight">
            Admin Portal User Guide
          </h1>
          <p className="text-slate-500 mt-3 text-lg">
            Comprehensive documentation for managing the EduClinic platform.
          </p>
        </div>
        <a
          href="/EduClinic_Admin_Guide.docx"
          download
          className="inline-flex items-center justify-center px-4 py-2.5 text-sm font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors shadow-sm whitespace-nowrap"
        >
          Download .docx
        </a>
      </div>

      <div className="flex gap-2 border-b border-slate-200 mb-10 overflow-x-auto pb-px">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`whitespace-nowrap py-3 px-6 text-[15px] font-semibold border-b-2 transition-colors ${
              activeTab === tab.id
                ? 'border-slate-900 text-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="animate-in fade-in duration-300">
        {activeTab === 'dashboard' && (
          <section>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                1. Dashboard
              </h2>
            </div>
            <div className="mt-6 mb-6">
              <img
                src="/guide-images/image1.png"
                alt="Dashboard Overview"
                className="border border-slate-200 shadow-sm w-full object-cover"
              />
            </div>
            <p className="text-slate-700 leading-relaxed text-lg">
              The Dashboard is the main page of the Admin Panel. It provides an
              overview of the platform by displaying analytics such as
              registered students, alumni, administrators, and verified user
              statistics. It also offers quick navigation to different
              management modules.
            </p>
          </section>
        )}

        {activeTab === 'users' && (
          <section>
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                2. Manage Users
              </h2>
            </div>

            <div className="space-y-16">
              <div>
                <h3 className="text-xl font-bold text-slate-800 mb-6 border-l-4 border-slate-900 pl-4">
                  2.1 Manage Alumni & Students
                </h3>
                <div className="space-y-12">
                  <div>
                    <h4 className="font-semibold text-slate-800 text-lg">
                      Step 1: Access Manage Alumni & Students
                    </h4>
                    <div className="mt-4 mb-4">
                      <img
                        src="/guide-images/image2.jpeg"
                        alt="Access Manage Alumni"
                        className="border border-slate-200 shadow-sm w-full max-w-5xl object-cover"
                      />
                    </div>
                    <p className="text-slate-700 text-lg leading-relaxed">
                      The administrator opens the Manage Users section from the
                      dashboard. This menu provides options to manage admins,
                      alumni & students, and pending registration requests.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-800 text-lg">
                      Step 2: Manage Registered Users
                    </h4>
                    <div className="mt-4 mb-4">
                      <img
                        src="/guide-images/image3.jpeg"
                        alt="Manage Registered Users"
                        className="border border-slate-200 shadow-sm w-full max-w-5xl object-cover"
                      />
                    </div>
                    <p className="text-slate-700 text-lg leading-relaxed">
                      The Manage Users page displays all registered users along
                      with their details. From this interface, the administrator
                      can create new user profiles, search users, edit records,
                      or access pending requests.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-bold text-slate-800 mb-6 border-l-4 border-slate-900 pl-4">
                  2.2 Pending Requests
                </h3>
                <div className="space-y-12">
                  <div>
                    <h4 className="font-semibold text-slate-800 text-lg">
                      Step 1: Open Pending Requests
                    </h4>
                    <div className="mt-4 mb-4">
                      <img
                        src="/guide-images/image4.jpeg"
                        alt="Open Pending Requests"
                        className="border border-slate-200 shadow-sm w-full max-w-5xl object-cover"
                      />
                    </div>
                    <p className="text-slate-700 text-lg leading-relaxed">
                      The administrator selects the Pending Requests option to
                      view users waiting for approval before they can access the
                      system.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-800 text-lg">
                      Step 2: Review Pending Registration Requests
                    </h4>
                    <div className="mt-4 mb-4">
                      <img
                        src="/guide-images/image5.jpeg"
                        alt="Review Registration Requests"
                        className="border border-slate-200 shadow-sm w-full max-w-5xl object-cover"
                      />
                    </div>
                    <p className="text-slate-700 text-lg leading-relaxed">
                      The Pending User page displays all users awaiting
                      approval. The administrator can view applicant information
                      and choose to approve, decline, or inspect further
                      details.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-800 text-lg">
                      Step 3: View Applicant Details
                    </h4>
                    <div className="mt-4 mb-4">
                      <img
                        src="/guide-images/image6.jpeg"
                        alt="View Applicant Details"
                        className="border border-slate-200 shadow-sm w-full max-w-5xl object-cover"
                      />
                    </div>
                    <p className="text-slate-700 text-lg leading-relaxed">
                      The Applicant Details view displays the applicant's
                      profile, submitted documents, role, school, and
                      verification information for review before approval.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-800 text-lg">
                      Step 4: Review Registration Request
                    </h4>
                    <p className="text-slate-700 text-lg leading-relaxed mt-2">
                      After verifying the applicant's information, the
                      administrator can approve or decline the registration
                      request.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {activeTab === 'gallery' && (
          <section>
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                3. Gallery
              </h2>
            </div>

            <div className="space-y-12">
              <div>
                <h4 className="font-semibold text-slate-800 text-lg">
                  Step 1: Access Gallery Module
                </h4>
                <div className="mt-4 mb-4">
                  <img
                    src="/guide-images/image7.jpeg"
                    alt="Access Gallery Module"
                    className="border border-slate-200 shadow-sm w-full max-w-5xl object-cover"
                  />
                </div>
                <p className="text-slate-700 text-lg leading-relaxed">
                  The administrator accesses the Gallery module to manage photo
                  albums and organize event images.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-slate-800 text-lg">
                  Step 2: Select Gallery Category
                </h4>
                <div className="mt-4 mb-4">
                  <img
                    src="/guide-images/image8.jpeg"
                    alt="Select Gallery Category"
                    className="border border-slate-200 shadow-sm w-full max-w-5xl object-cover"
                  />
                </div>
                <p className="text-slate-700 text-lg leading-relaxed">
                  The administrator chooses an appropriate category such as
                  Conference, Sports, Cultural Events, or Alumni Meet to
                  organize uploaded images.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-slate-800 text-lg">
                  Step 3: Create Photo Album
                </h4>
                <div className="mt-4 mb-4">
                  <img
                    src="/guide-images/image9.jpeg"
                    alt="Create Photo Album"
                    className="border border-slate-200 shadow-sm w-full max-w-5xl object-cover"
                  />
                </div>
                <p className="text-slate-700 text-lg leading-relaxed">
                  After entering the album information and selecting the
                  category, the administrator uploads the cover image and
                  creates the gallery album.
                </p>
              </div>
            </div>
          </section>
        )}

        {activeTab === 'events' && (
          <section>
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                4. Events
              </h2>
            </div>

            <div className="space-y-12">
              <div>
                <h4 className="font-semibold text-slate-800 text-lg">
                  Step 1: Access Events Module
                </h4>
                <div className="mt-4 mb-4">
                  <img
                    src="/guide-images/image10.jpeg"
                    alt="Access Events Module"
                    className="border border-slate-200 shadow-sm w-full max-w-5xl object-cover"
                  />
                </div>
                <p className="text-slate-700 text-lg leading-relaxed">
                  Open the Events module from the dashboard to manage all events
                  and access event-related features.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-slate-800 text-lg">
                  Step 2: Create a New Event
                </h4>
                <div className="mt-4 mb-4">
                  <img
                    src="/guide-images/image11.jpeg"
                    alt="Create New Event"
                    className="border border-slate-200 shadow-sm w-full max-w-5xl object-cover"
                  />
                </div>
                <p className="text-slate-700 text-lg leading-relaxed">
                  Enter the event information, including title, organizer,
                  venue, schedule, registration details, cover image, and
                  description to create a new event.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-slate-800 text-lg">
                  Step 3: View Event Details
                </h4>
                <div className="mt-4 mb-6 space-y-6">
                  <img
                    src="/guide-images/image12.jpeg"
                    alt="View Event Details 1"
                    className="border border-slate-200 shadow-sm w-full max-w-5xl object-cover"
                  />
                  <img
                    src="/guide-images/image13.jpeg"
                    alt="View Event Details 2"
                    className="border border-slate-200 shadow-sm w-full max-w-5xl object-cover"
                  />
                </div>
                <p className="text-slate-700 text-lg leading-relaxed">
                  Select an event to view its complete details, including the
                  organizer, venue, registration limit, event schedule, and
                  description.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-slate-800 text-lg">
                  Step 4: View Event Registrations
                </h4>
                <div className="mt-4 mb-6 space-y-6">
                  <img
                    src="/guide-images/image14.jpeg"
                    alt="View Event Registrations 1"
                    className="border border-slate-200 shadow-sm w-full max-w-5xl object-cover"
                  />
                  <img
                    src="/guide-images/image15.jpeg"
                    alt="View Event Registrations 2"
                    className="border border-slate-200 shadow-sm w-full max-w-5xl object-cover"
                  />
                </div>
                <p className="text-slate-700 text-lg leading-relaxed">
                  Click the View Registrations button to access the list of
                  participants registered for the selected event. This page
                  displays registration details, participant information,
                  registration status, and provides an option to export the
                  registration data as a CSV file.
                </p>
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
