import { 
  User, 
  ListChecks, 
  Gift, 
  Share2, 
  BarChart3, 
  Shield
} from 'lucide-react';

type FeatureItem = {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
  bgColor: string;
  borderColor: string;
};

const Card = ({ icon, title, description, color, bgColor, borderColor }: FeatureItem) => (
  <div className={`p-6 rounded-xl border ${borderColor} bg-white shadow-sm hover:shadow-md transition-shadow`}>
    <div className={`${bgColor} ${color} w-12 h-12 rounded-lg flex items-center justify-center mb-4`}>
      {icon}
    </div>
    <h3 className="text-lg font-semibold mb-2">{title}</h3>
    <p className="text-muted-foreground">{description}</p>
  </div>
);

const features: FeatureItem[] = [
  {
    icon: <User className="w-6 h-6" />,
    title: 'Create Account',
    description: 'Sign up in minutes with your social accounts and complete your profile.',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-100'
  },
  {
    icon: <ListChecks className="w-6 h-6" />,
    title: 'Complete Tasks',
    description: 'Perform simple social media tasks like liking, sharing or commenting.',
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-100'
  },
  {
    icon: <Gift className="w-6 h-6" />,
    title: 'Earn Rewards',
    description: 'Get rewarded for each completed task and cash out via multiple methods.',
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-100'
  },
  {
    icon: <Share2 className="w-6 h-6" />,
    title: 'Invite Friends',
    description: 'Share your referral link and earn 10% of your friends\' earnings for life.',
    color: 'text-rose-600',
    bgColor: 'bg-rose-50',
    borderColor: 'border-rose-100'
  },
  {
    icon: <BarChart3 className="w-6 h-6" />,
    title: 'Track Growth',
    description: 'Monitor your social media growth and earnings with detailed analytics.',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-100'
  },
  {
    icon: <Shield className="w-6 h-6" />,
    title: 'Stay Secure',
    description: 'All tasks are verified and reviewed for quality and security.',
    color: 'text-teal-600',
    bgColor: 'bg-teal-50',
    borderColor: 'border-teal-100'
  }
];

const features: FeatureItem[] = [
  {
    icon: <User />,
    title: 'Create Account',
    description: 'Sign up in minutes with your social accounts and complete your profile.',
    color: 'text-primary',
    bgColor: 'bg-blue-100'
  },
  {
    icon: <ListChecks />,
    title: 'Complete Tasks',
    description: 'Perform simple social media tasks like liking, sharing or commenting.',
    color: 'text-green-600',
    bgColor: 'bg-green-100'
  },
  {
    icon: <Gift />,
    title: 'Earn Rewards',
    description: 'Get rewarded for each completed task and cash out via multiple methods.',
    color: 'text-amber-500',
    bgColor: 'bg-amber-100'
  },
  {
    icon: <Share2 />,
    title: 'Invite Friends',
    description: 'Share your referral link and earn 10% of your friends\' earnings for life.',
    color: 'text-rose-500',
    bgColor: 'bg-rose-100'
  },
  {
    icon: <BarChart3 />,
    title: 'Track Growth',
    description: 'Monitor your social media growth and earnings with detailed analytics.',
    color: 'text-purple-600',
    bgColor: 'bg-purple-100'
  },
  {
    icon: <Shield />,
    title: 'Stay Secure',
    description: 'All tasks are verified and reviewed for quality and security.',
    color: 'text-teal-600',
    bgColor: 'bg-teal-100'
  }
];

const Features = () => {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900">How SocialTask Hub Works</h2>
          <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">
            Complete simple tasks on social media platforms and earn rewards in just a few steps
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="bg-gray-50 rounded-xl p-8 hover:shadow-md transition-shadow duration-200"
            >
              <div className={`w-12 h-12 ${feature.bgColor} ${feature.color} flex items-center justify-center rounded-full mb-5`}>
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
