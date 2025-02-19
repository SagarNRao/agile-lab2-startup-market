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

export default function Feed() {
  const [startups, setStartups] = useState<
    {
      owner: string;
      password: string;
      id: number;
      name: string;
      description: string;
      roles: string;
      members: string | null;
      applications: { role: string; applicant: string }[];
    }[]
  >([]);
  
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
      const newStartup = {
        ...formData,
        id: Date.now(),
        members: null,
        applications: [] as { role: string; applicant: string }[]
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
    
    setStartups(startups.map(startup => {
      if (startup.id === startupId) {
        return {
          ...startup,
          applications: [...(startup.applications || []), { role, applicant: name }]
        };
      }
      return startup;
    }));

    setApplicants({ ...applicants, [role]: "" });
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

    // For debugging - remove in production
    console.log('Checking auth:', {
      inputOwner: authState.ownerInput,
      actualOwner: startup.owner,
      inputPassword: authState.passwordInput,
      actualPassword: startup.password
    });

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
                        <div className="space-y-4">
                          <h3 className="font-medium">Applications:</h3>
                          {startup.applications && startup.applications.length > 0 ? (
                            startup.applications.map((app, index) => (
                              <div key={index} className="border p-2 rounded">
                                <p><strong>Role:</strong> {app.role}</p>
                                <p><strong>Applicant:</strong> {app.applicant}</p>
                              </div>
                            ))
                          ) : (
                            <p>No applications yet.</p>
                          )}
                        </div>
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