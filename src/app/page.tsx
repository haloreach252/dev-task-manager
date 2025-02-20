import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function HomePage() {
  return (
    <main className='p-8 space-y-8'>
      {/* Welcome Banner */}
      <div className='bg-blue-600 text-white rounded-lg p-6 shadow-md'>
        <h1 className='text-3xl font-bold'>Welcome to Miniverse Dev Task Manager</h1>
        <p className='mt-2'>Organize your development process with ease.</p>
        <div className='mt-4'>
          <Link href='/teams'>
            <Button variant='secondary'>View Your Teams</Button>
          </Link>
          <Link href='/projects'>
            <Button variant='outline'>Browse Projects</Button>
          </Link>
        </div>
      </div>

      {/* Quick Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Total Teams</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">4</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total Projects</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">12</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Active Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">34</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Completed Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">87</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="space-x-4">
        <Link href="/teams">
          <Button>Create New Team</Button>
        </Link>
        <Link href="/projects">
          <Button variant="outline">Create New Project</Button>
        </Link>
      </div>
    </main>
  )
}