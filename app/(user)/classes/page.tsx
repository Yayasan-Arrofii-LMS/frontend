"use client";

import Image from "next/image";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Clock, User, Users, Search } from "lucide-react";
import { useState } from "react";

// Dummy classes data (expanded)
const ALL_CLASSES = [
  {
    id: "1",
    title: "Introduction to React",
    description: "Learn the fundamentals of React including components, props, and state management.",
    teacher: "Dr. Sarah Johnson",
    students: 45,
    duration: "8 weeks",
    level: "Beginner",
    image: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=250&fit=crop",
  },
  {
    id: "2",
    title: "Advanced JavaScript",
    description: "Master advanced JavaScript concepts like closures, async/await, and design patterns.",
    teacher: "Prof. Michael Chen",
    students: 32,
    duration: "10 weeks",
    level: "Advanced",
    image: "https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a?w=400&h=250&fit=crop",
  },
  {
    id: "3",
    title: "Web Design Fundamentals",
    description: "Create beautiful and responsive web designs using modern CSS and design principles.",
    teacher: "Emily Rodriguez",
    students: 58,
    duration: "6 weeks",
    level: "Beginner",
    image: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&h=250&fit=crop",
  },
  {
    id: "4",
    title: "Python for Data Science",
    description: "Learn Python programming with a focus on data analysis and visualization.",
    teacher: "Dr. James Wilson",
    students: 67,
    duration: "12 weeks",
    level: "Intermediate",
    image: "https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=400&h=250&fit=crop",
  },
  {
    id: "5",
    title: "Mobile App Development",
    description: "Build cross-platform mobile applications using React Native.",
    teacher: "Lisa Anderson",
    students: 41,
    duration: "10 weeks",
    level: "Intermediate",
    image: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400&h=250&fit=crop",
  },
  {
    id: "6",
    title: "Database Design",
    description: "Master database design principles and SQL queries for modern applications.",
    teacher: "Prof. David Lee",
    students: 39,
    duration: "8 weeks",
    level: "Intermediate",
    image: "https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=400&h=250&fit=crop",
  },
];

export default function ClassesPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredClasses = ALL_CLASSES.filter((classItem) =>
    classItem.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    classItem.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    classItem.teacher.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="mb-3 text-4xl font-bold">All Classes</h1>
        <p className="text-lg text-muted-foreground">
          Browse and explore all available courses
        </p>
      </div>

      <div className="mb-8">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search classes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {filteredClasses.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-lg text-muted-foreground">No classes found</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredClasses.map((classItem) => (
            <Card key={classItem.id} className="overflow-hidden transition-shadow hover:shadow-lg">
              <div className="aspect-video w-full overflow-hidden bg-muted relative">
                <Image
                  src={classItem.image}
                  alt={classItem.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              </div>
              <CardHeader>
                <div className="mb-2 flex items-center gap-2">
                  <span className="text-xs font-medium text-primary">
                    {classItem.level}
                  </span>
                </div>
                <CardTitle className="line-clamp-1">{classItem.title}</CardTitle>
                <CardDescription className="line-clamp-2">
                  {classItem.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <User className="h-4 w-4" />
                  <span>{classItem.teacher}</span>
                </div>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <span>{classItem.students} students</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>{classItem.duration}</span>
                  </div>
                </div>
                <Button className="w-full" variant="outline">
                  View Details
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
