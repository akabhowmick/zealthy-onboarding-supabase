import { createBrowserRouter } from "react-router-dom";
import App from "./App";
import AdminPage from "./pages/AdminPage";
import DataPage from "./pages/DataPage";
import OnboardingPage from "./pages/OnboardingPage";


export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { index: true, element: <OnboardingPage /> },
      { path: "admin", element: <AdminPage /> },
      { path: "data", element: <DataPage /> }
    ]
  }
]);
