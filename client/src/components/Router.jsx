import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import App from "./App";
import Dashboard from "./Dashboard";
import ErrorPage from './ErrorPage';
import Reader from './Reader';

const Router = () => {
    const router = createBrowserRouter([
        {
            path: "/",
            element: <App></App>,
            errorElement: <ErrorPage></ErrorPage>

        },
        {
            path: "dashboard",
            element: <Dashboard></Dashboard>
        },
        {
            path: "login",
        },
        {
            path: "reader",
            element: <Reader></Reader>
        }
    ]);
    return <RouterProvider router = {router} />
};
export default Router;
