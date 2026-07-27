import { Outlet } from "react-router-dom"

export default function ManageUsersLayout() {
  return (
    <div className="w-full p-4 sm:p-6">
      <Outlet />
    </div>
  )
}
