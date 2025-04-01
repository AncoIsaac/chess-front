import { createBrowserRouter, RouterProvider } from "react-router"
import HomeLayout from "../page/HomeLayout"
import HomePageLayout from "../page/Home/HomePageLayout"
import Login from "../page/Login/Login"
import DashboardHome from "../page/dashboard/DashboardHome"
import HomeChess from "../page/chessBoard/HomeChess"
const routerDom = createBrowserRouter([
  {
    path: "/",
    element: <HomeLayout />,
    errorElement: <div>Error</div>,
    children: [
      {
        index: true,
        element: <Login/>,
      },
      {
        path: 'home',
        element: <HomePageLayout/>,
        children: [
          {
            index: true,
            element: <DashboardHome/>,
          },
          {
            path: 'chess',
            element: <HomeChess/>,
          }
        ]
      }
    ]
  }, 
])

const Router = () => {
  return (
    <RouterProvider router={routerDom} />
  )
}

export default Router