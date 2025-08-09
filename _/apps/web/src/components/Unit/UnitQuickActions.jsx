import { History, Calendar, Settings, Clock, MapPin } from "lucide-react";

const ActionLink = ({ href, icon: Icon, text }) => (
  <a
    href={href}
    className="w-full flex items-center px-4 py-2 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
  >
    <Icon className="h-4 w-4 mr-3" />
    {text}
  </a>
);

export function UnitQuickActions({ unitId }) {
  const commonActions = [
    { href: `/units/${unitId}/tasks`, icon: Calendar, text: "View Tasks" },
    {
      href: `/units/${unitId}/maintenance`,
      icon: Settings,
      text: "Maintenance History",
    },
    {
      href: `/units/${unitId}/work-sessions`,
      icon: Clock,
      text: "Work Sessions",
    },
    {
      href: `/units/${unitId}/location`,
      icon: MapPin,
      text: "Location Tracking",
    },
  ];
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Quick Actions
      </h3>
      <div className="space-y-3">
        <a
          href={`/units/${unitId}/history`}
          className="w-full flex items-center px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
        >
          <History className="h-4 w-4 mr-3" />
          View History & Logs
        </a>

        {commonActions.map((action) => (
          <ActionLink key={action.href} {...action} />
        ))}
      </div>
    </div>
  );
}
