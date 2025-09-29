import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { X, MapPin, Linkedin } from 'lucide-react';
import { toast } from 'sonner';

const INTERESTS = [
  'Technology', 'Marketing', 'Finance', 'Design', 'Sales', 'HR',
  'Product Management', 'Data Science', 'Engineering', 'Consulting',
  'Healthcare', 'Education', 'Real Estate', 'Legal', 'Media',
  'Startup', 'AI/ML', 'Blockchain', 'Sustainability', 'Leadership'
];

const INDUSTRIES = [
  'Technology & Software', 'Healthcare & Medical', 'Financial Services', 'Education',
  'Manufacturing', 'Retail & E-commerce', 'Consulting', 'Real Estate',
  'Media & Entertainment', 'Non-profit', 'Government', 'Energy & Utilities',
  'Transportation & Logistics', 'Hospitality & Tourism', 'Legal Services',
  'Construction', 'Agriculture', 'Telecommunications', 'Automotive', 'Other'
];

interface OnboardingFormData {
  firstName: string;
  lastName: string;
  preferredUsername: string;
  email: string;
  password: string;
  jobTitle?: string;
  bio?: string;
  interests: string[];
  industry?: string;
  zipCode?: string;
}

interface OnboardingProps {
  onComplete: (data: any) => void;
}

export const Onboarding = ({ onComplete }: OnboardingProps) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<OnboardingFormData>({
    firstName: '',
    lastName: '',
    preferredUsername: '',
    email: '',
    password: '',
    jobTitle: '',
    bio: '',
    interests: [],
    industry: '',
    zipCode: ''
  });

  const handleInterestToggle = (interest: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  const handleSubmit = () => {
    const userData = {
      id: `user_${Date.now()}`,
      firstName: formData.firstName,
      lastName: formData.lastName,
      name: `${formData.firstName} ${formData.lastName}`.trim(),
      email: formData.email,
      title: formData.jobTitle || '',
      company: '',
      location: formData.zipCode || '',
      bio: formData.bio || '',
      avatar: '',
      skills: [],
      interests: formData.interests || [],
      goals: [],
      experience: '',
      lookingFor: [],
      onboardingCompleted: true,
      profileComplete: true,
      createdAt: new Date().toISOString(),
      lastActive: new Date().toISOString(),
      subscriptionStatus: 'preview',
      termsAccepted: false
    };
    
    toast.success('Welcome to Networking BudE!');
    onComplete(userData);
  };

  const handleLinkedInConnect = () => {
    toast.success('Connected to LinkedIn!');
    
    const linkedInData = {
      firstName: 'Sarah',
      lastName: 'Johnson',
      preferredUsername: 'sarah.johnson',
      email: 'sarah.johnson@email.com',
      jobTitle: 'Senior Product Manager',
      bio: 'Experienced Product Manager with a passion for building innovative digital solutions.',
      industry: 'Technology & Software',
      interests: ['Product Management', 'Technology', 'Leadership', 'Design']
    };
    
    setFormData(prev => ({ ...prev, ...linkedInData }));
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="border rounded-lg p-6 bg-blue-50 border-blue-200 mb-4">
              <div className="text-center space-y-3">
                <h4 className="font-medium text-blue-900">Quick Setup</h4>
                <p className="text-sm text-blue-700">
                  Import your professional information from LinkedIn
                </p>
                <Button onClick={handleLinkedInConnect} className="bg-blue-600 hover:bg-blue-700 text-white">
                  <Linkedin className="h-4 w-4 mr-2" />
                  Import From LinkedIn
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              />
            </div>
            
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="jobTitle">Job Title</Label>
              <Input
                id="jobTitle"
                value={formData.jobTitle || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, jobTitle: e.target.value }))}
                placeholder="e.g., Senior Marketing Manager"
              />
            </div>

            <div>
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                placeholder="Tell us about yourself..."
              />
            </div>
            
            <div>
              <Label>Industry</Label>
              <Select value={formData.industry} onValueChange={(value) => setFormData(prev => ({ ...prev, industry: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your industry" />
                </SelectTrigger>
                <SelectContent>
                  {INDUSTRIES.map((industry) => (
                    <SelectItem key={industry} value={industry}>
                      {industry}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="zipCode">
                <MapPin className="h-4 w-4 inline mr-1" />
                Zip Code
              </Label>
              <Input
                id="zipCode"
                value={formData.zipCode}
                onChange={(e) => setFormData(prev => ({ ...prev, zipCode: e.target.value }))}
                placeholder="Enter zip code"
                maxLength={5}
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <div>
              <Label>Professional Interests</Label>
              <p className="text-sm text-muted-foreground mb-4">
                Select topics that interest you professionally
              </p>
              <div className="flex flex-wrap gap-2">
                {INTERESTS.map((interest) => (
                  <Badge
                    key={interest}
                    variant={formData.interests.includes(interest) ? "default" : "outline"}
                    className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                    onClick={() => handleInterestToggle(interest)}
                  >
                    {interest}
                    {formData.interests.includes(interest) && (
                      <X className="h-3 w-3 ml-1" />
                    )}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="h-16 w-16 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4">
            NB
          </div>
          <CardTitle className="text-3xl font-bold">Welcome to Networking BudE</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Progress indicator */}
            <div className="flex space-x-2">
              {[1, 2, 3].map((num) => (
                <div
                  key={num}
                  className={`flex-1 h-2 rounded-full ${
                    num <= step ? 'bg-primary' : 'bg-muted'
                  }`}
                />
              ))}
            </div>

            {renderStep()}

            {/* Navigation */}
            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={() => setStep(prev => Math.max(1, prev - 1))}
                disabled={step === 1}
              >
                Previous
              </Button>
              
              {step < 3 ? (
                <Button onClick={() => setStep(prev => Math.min(3, prev + 1))}>
                  Continue
                </Button>
              ) : (
                <Button onClick={handleSubmit} className="bg-green-600 text-white hover:bg-green-700">
                  Let's Go!
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Onboarding;