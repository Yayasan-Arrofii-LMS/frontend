import { Card, CardContent } from "@/components/ui/card";
import { GraduationCap, Target, Users, Heart } from "lucide-react";

export default function AboutPage() {
  const currentYear = new Date().getFullYear();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-4xl font-bold">About Sekolah Alam</h1>
          <p className="text-lg text-muted-foreground">
            Empowering education through nature and technology
          </p>
        </div>

        <div className="prose dark:prose-invert mx-auto mb-12">
          <h2>Our Story</h2>
          <p>
            Sekolah Alam was founded with a vision to revolutionize education by
            combining the best of nature-based learning with modern technology.
            We believe that every student deserves access to quality education
            that nurtures not just their minds, but also their connection to the
            natural world.
          </p>

          <h2>Our Mission</h2>
          <p>
            To provide an innovative learning management system that empowers
            educators to create engaging, nature-inspired curricula while giving
            students the tools they need to thrive in a digital age. We strive to
            make education accessible, enjoyable, and meaningful for everyone.
          </p>
        </div>

        <div className="mb-12 grid gap-6 md:grid-cols-2">
          <Card>
            <CardContent className="flex flex-col items-center p-6 text-center">
              <div className="mb-4 rounded-full bg-primary/10 p-4">
                <Target className="h-8 w-8 text-primary" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Our Vision</h3>
              <p className="text-muted-foreground">
                To be the leading platform that bridges traditional nature-based
                education with cutting-edge digital learning tools.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex flex-col items-center p-6 text-center">
              <div className="mb-4 rounded-full bg-primary/10 p-4">
                <Heart className="h-8 w-8 text-primary" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Our Values</h3>
              <p className="text-muted-foreground">
                Innovation, accessibility, sustainability, and student-centered
                learning are at the core of everything we do.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="mb-12">
          <h2 className="mb-6 text-center text-3xl font-bold">Why Choose Us?</h2>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 rounded-full bg-primary/10 p-4">
                <GraduationCap className="h-8 w-8 text-primary" />
              </div>
              <h3 className="mb-2 text-lg font-semibold">Expert Educators</h3>
              <p className="text-sm text-muted-foreground">
                Our platform is designed by experienced educators who understand
                the challenges of modern teaching.
              </p>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="mb-4 rounded-full bg-primary/10 p-4">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <h3 className="mb-2 text-lg font-semibold">Community Driven</h3>
              <p className="text-sm text-muted-foreground">
                Join a vibrant community of learners and educators passionate
                about education and nature.
              </p>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="mb-4 rounded-full bg-primary/10 p-4">
                <Heart className="h-8 w-8 text-primary" />
              </div>
              <h3 className="mb-2 text-lg font-semibold">Student Focused</h3>
              <p className="text-sm text-muted-foreground">
                Every feature is designed with student success and engagement
                as the top priority.
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-muted/50 p-8 text-center">
          <h2 className="mb-4 text-2xl font-bold">Get in Touch</h2>
          <p className="mb-4 text-muted-foreground">
            Have questions or want to learn more about Sekolah Alam?
          </p>
          <p className="text-sm text-muted-foreground">
            Email us at:{" "}
            <a
              href="mailto:info@sekolahalam.edu"
              className="text-primary hover:underline"
            >
              info@sekolahalam.edu
            </a>
          </p>
        </div>
      </div>

      <footer className="mt-16 border-t pt-8 text-center text-sm text-muted-foreground">
        <p>&copy; {currentYear} Sekolah Alam. All rights reserved.</p>
      </footer>
    </div>
  );
}
