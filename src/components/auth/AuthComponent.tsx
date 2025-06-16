import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChefHat } from "lucide-react";
import { useEffect, useState } from "react";
import SignInForm from "./SignInForm";
import SignUpForm from "./SignUpForm";

interface AuthComponentProps {
  defaultTab?: string;
  onClose?: () => void;
}

const AuthComponent = ({
  defaultTab = "signin",
  onClose,
}: AuthComponentProps) => {
  const [activeTab, setActiveTab] = useState(defaultTab);

  useEffect(() => {
    setActiveTab(defaultTab);
  }, [defaultTab]);

  return (
    <div className="flex items-center justify-center bg-background rounded-lg">
      <Card className="w-full">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <ChefHat className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-2xl">FreshSavings</CardTitle>
          <CardDescription>
            Track groceries, generate recipes, and connect with your community
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>

            <TabsContent value="signin">
              <SignInForm onClose={onClose} />
            </TabsContent>

            <TabsContent value="signup">
              <SignUpForm />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthComponent;
