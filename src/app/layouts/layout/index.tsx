import React from 'react'

export const getNoneLayout = (page: React.ReactElement) => page

export const getDefaultLayout = (page: React.ReactElement) => {
  return (
    <div className="min-h-screen bg-white">
      {page}
    </div>
  )
}
