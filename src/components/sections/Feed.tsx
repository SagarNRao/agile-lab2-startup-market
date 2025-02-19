"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type Application = {
  role: string;
  applicant: string;
  status: 'pending' | 'accepted' | 'rejected';
};

type TeamMember = {
  name: string;
  role: string;
};

type Startup = {
  owner: string;
  password: string;
  id: number;
  name: string;
  description: string;
  roles: string;
  members: TeamMember[];
  applications: Application[];
};

export default function Feed() {
  const [startups, setStartups] = useState<Startup[]>([]);
  
  const [formData, setFormData] = useState({
    owner: "",
    password: "",
    name: "",
    description: "",
    roles: "",
  });

  const [applicants, setApplicants] = useState<{ [key: string]: string }>({});
  const [authState, setAuthState] = useState({
    ownerInput: "",
    passwordInput: "",
    error: "",
    isAuthenticated: false,
    currentStartupId: null as number | null
  });

  const handleChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: any) => {
    e.preventDefault();
    if (formData.name && formData.description && formData.roles && formData.password) {
      const newStartup: Startup = {
        ...formData,
        id: Date.now(),
        members: [],
        applications: []
      };
      setStartups([...startups, newStartup]);
      setFormData({
        owner: "",
        password: "",
        name: "",
        description: "",
        roles: "",
      });
    }
  };

  const handleApply = (startupId: number, role: string, name: string) => {
    if (!name) return;
    
    setStartups(prevStartups => 
      prevStartups.map(startup => {
        if (startup.id === startupId) {
          const newApplication: Application = {
            role,
            applicant: name,
            status: 'pending'
          };
          return {
            ...startup,
            applications: [...startup.applications, newApplication]
          };
        }
        return startup;
      })
    );

    setApplicants({ ...applicants, [role]: "" });
  };

  const handleAcceptApplication = (startupId: number, application: Application) => {
    setStartups(prevStartups => 
      prevStartups.map(startup => {
        if (startup.id === startupId) {
          const updatedApplications = startup.applications.map(app => 
            app.applicant === application.applicant && app.role === application.role
              ? { ...app, status: 'accepted' as const }
              : app
          );

          const newMember: TeamMember = {
            name: application.applicant,
            role: application.role
          };

          return {
            ...startup,
            applications: updatedApplications,
            members: [...startup.members, newMember]
          };
        }
        return startup;
      })
    );
  };

  const handleAuthSubmit = (startupId: number) => {
    const startup = startups.find(s => s.id === startupId);
    
    if (!startup) {
      setAuthState({
        ...authState,
        error: "Startup not found",
        isAuthenticated: false
      });
      return;
    }

    if (authState.ownerInput === startup.owner && authState.passwordInput === startup.password) {
      setAuthState({
        ...authState,
        error: "",
        isAuthenticated: true,
        currentStartupId: startupId
      });
    } else {
      setAuthState({
        ...authState,
        error: "Invalid owner name or password",
        isAuthenticated: false,
        currentStartupId: null
      });
    }
  };

  const handleDialogClose = () => {
    setAuthState({
      ownerInput: "",
      passwordInput: "",
      error: "",
      isAuthenticated: false,
      currentStartupId: null
    });
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Post Your Startup Idea</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          name="owner"
          placeholder="Startup Owner"
          value={formData.owner}
          onChange={handleChange}
        />
        <Input
          name="name"
          placeholder="Startup Name"
          value={formData.name}
          onChange={handleChange}
        />
        <Input
          name="password"
          type="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
        />
        <Textarea
          name="description"
          placeholder="Describe your startup"
          value={formData.description}
          onChange={handleChange}
        />
        <Input
          name="roles"
          placeholder="Roles needed (comma separated)"
          value={formData.roles}
          onChange={handleChange}
        />
        <Button type="submit">Post Idea</Button>
      </form>

      <div className="space-y-4">
        {startups.map((startup) => (
          <Card key={startup.id}>
            <CardContent className="p-4">
              <div className="flex">
                <div className="w-full">
                  <h2 className="text-xl font-semibold">{startup.name}</h2>
                  <p className="text-gray-600">by {startup.owner}</p>
                  <p className="text-gray-600">{startup.description}</p>
                  <p className="text-sm text-blue-600">
                    Looking for: {startup.roles}
                  </p>
                </div>
              </div>

              <div className="flex mt-4">
                <Sheet>
                  <SheetTrigger asChild>
                    <Button>Join Team</Button>
                  </SheetTrigger>
                  <SheetContent>
                    <SheetHeader>
                      <SheetTitle>Join Team</SheetTitle>
                      <SheetDescription>
                        <p>Roles needed:</p>
                        <form onSubmit={(e) => e.preventDefault()}>
                          <div className="list-disc list-inside">
                            {startup.roles.split(",").map((role, index) => (
                              <div key={index} className="mt-4">
                                <p>{role.trim()}</p>
                                <div className="flex space-x-2">
                                  <Input
                                    placeholder="Name"
                                    value={applicants[role.trim()] || ""}
                                    onChange={(e) =>
                                      setApplicants({
                                        ...applicants,
                                        [role.trim()]: e.target.value,
                                      })
                                    }
                                  />
                                  <Button
                                    type="button"
                                    onClick={() =>
                                      handleApply(
                                        startup.id,
                                        role.trim(),
                                        applicants[role.trim()]
                                      )
                                    }
                                  >
                                    Apply
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </form>
                      </SheetDescription>
                    </SheetHeader>
                    <SheetFooter>
                      <SheetClose asChild>
                        <Button type="button">Close</Button>
                      </SheetClose>
                    </SheetFooter>
                  </SheetContent>
                </Sheet>

                <div className="p-1"></div>

                <Dialog onOpenChange={handleDialogClose}>
                  <DialogTrigger asChild>
                    <Button variant="outline">View Team</Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>View Team</DialogTitle>
                      <DialogDescription>
                        Please verify your identity to view team applications.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="owner" className="text-right">
                          Owner
                        </Label>
                        <Input
                          id="owner"
                          value={authState.ownerInput}
                          onChange={(e) => setAuthState({
                            ...authState,
                            ownerInput: e.target.value
                          })}
                          className="col-span-3"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="password" className="text-right">
                          Password
                        </Label>
                        <Input
                          id="password"
                          type="password"
                          value={authState.passwordInput}
                          onChange={(e) => setAuthState({
                            ...authState,
                            passwordInput: e.target.value
                          })}
                          className="col-span-3"
                        />
                      </div>
                      {authState.error && (
                        <p className="text-red-500 text-center">{authState.error}</p>
                      )}
                      {authState.isAuthenticated && authState.currentStartupId === startup.id && (
                        <div className="space-y-6">
                          <div>
                            <h3 className="font-medium mb-2">Current Team Members:</h3>
                            {startup.members.length > 0 ? (
                              <div className="space-y-2">
                                {startup.members.map((member, index) => (
                                  <div key={index} className="border p-2 rounded bg-black-500">
                                    <p><strong>{member.name}</strong> - {member.role}</p>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p>No team members yet</p>
                            )}
                          </div>
                          
                          <div>
                            <h3 className="font-medium mb-2">Pending Applications:</h3>
                            {startup.applications.filter(app => app.status === 'pending').length > 0 ? (
                              <div className="space-y-2">
                                {startup.applications
                                  .filter(app => app.status === 'pending')
                                  .map((app, index) => (
                                    <div key={index} className="border p-2 rounded flex justify-between items-center">
                                      <div>
                                        <p><strong>Role:</strong> {app.role}</p>
                                        <p><strong>Applicant:</strong> {app.applicant}</p>
                                      </div>
                                      <Button 
                                        onClick={() => handleAcceptApplication(startup.id, app)}
                                        size="sm"
                                      >
                                        Accept
                                      </Button>
                                    </div>
                                  ))
                              }
                              </div>
                            ) : (
                              <p>No pending applications</p>
                            )}
                          </div>
                        </div>
                      )}

                      {authState.isAuthenticated && authState.currentStartupId === startup.id && (
                        <Button 
                          type="button" 
                          onClick={() => window.location.href = `/groupChat`}
                        >
                          Go to Group Chat
                        </Button>
                      )}
                    </div>
                    <DialogFooter>
                      {!authState.isAuthenticated && (
                        <Button type="button" onClick={() => handleAuthSubmit(startup.id)}>
                          Verify
                        </Button>
                      )}
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}