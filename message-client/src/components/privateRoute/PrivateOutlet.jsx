import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import Cookies from 'js-cookie';

const PrivateOutlet = () => {
    const happinessCookie = Cookies.get("happiness-cookie");
return happinessCookie ? <Outlet /> : <Navigate to="/auth" />;

};

export default PrivateOutlet;