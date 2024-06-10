import React from 'react';
import AppLayout from '../components/layout/AppLayout';

const Home = () => {
    return (
        <div className='flex-con'>
            <p>Select a friend to chat</p>
        </div>
    );
};

export default AppLayout()(Home);