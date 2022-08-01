import Link from 'next/link'
import React from 'react'

function Header() {
  return (
    <header className='flex justify-between p-5 max-w-5xl mx-auto'>
        <div className='flex items-center space-x-5'>
            <Link href="/">
                <img className='w-44 object-contain cursor-pointer'
                src="https://links.papareact.com/yvf" alt="medium logo" />
            </Link>
            <div className='hidden md:inline-flex items-center space-x-5'>
                <h2>About</h2>
                <h2>Contact</h2>
                <h2 className='text-white bg-green-500 px-4 py-1 rounded-full'>Follow</h2>
            </div>
        </div>
        <div className='flex text-green-600 items-center space-x-5'>
            <h3>Sign In</h3>
            <h3 className="border border-green-600 px-4 py-1 rounded-full">Get Started</h3>
        </div>
    </header>
  )
}

export default Header