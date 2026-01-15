import Sidebar from './Sidebar'

export default function AdminLayout({ children }) {
    return (
        <div className="flex h-screen bg-brand-background overflow-hidden">
            {/* Sidebar - Fixed width */}
            <Sidebar />

            {/* Main Content - Flex Grow */}
            <div className="flex-1 flex flex-col h-full overflow-hidden">

                {/* Top Header (Optional, for Breadcrumbs or Search) */}
                <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 shadow-sm z-10">
                    <h2 className="text-lg font-medium text-gray-800">Panel de Administración</h2>
                    {/* Add notification bell or other top-level actions here if needed */}
                </header>

                {/* Content Area - Scrollable */}
                <main className="flex-1 overflow-y-auto p-4 md:p-8">
                    <div className="max-w-7xl mx-auto w-full">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    )
}
