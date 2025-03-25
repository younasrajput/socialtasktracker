import { Star } from 'lucide-react';

type Testimonial = {
  content: string;
  author: {
    name: string;
    role: string;
    avatarUrl: string;
  };
  rating: number;
};

const testimonials: Testimonial[] = [
  {
    content: "SocialTask Hub helped me grow my Instagram following by 300% in just 2 months. The tasks are easy to complete and the rewards are excellent!",
    author: {
      name: "Jessica Thompson",
      role: "Food Blogger",
      avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=48&h=48&q=80"
    },
    rating: 5
  },
  {
    content: "As a small business owner, SocialTask Hub has been a game-changer for my social media marketing. The platform is intuitive and the support team is always helpful.",
    author: {
      name: "Michael Rodriguez",
      role: "Small Business Owner",
      avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=48&h=48&q=80"
    },
    rating: 5
  },
  {
    content: "I've tried several social media growth platforms, but SocialTask Hub stands out with its genuine engagement and fair rewards system. Highly recommended!",
    author: {
      name: "David Chen",
      role: "Content Creator",
      avatarUrl: "https://images.unsplash.com/photo-1569913486515-b74bf7751574?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=48&h=48&q=80"
    },
    rating: 4.5
  },
  {
    content: "The referral program is amazing! I've earned over $500 just by inviting my network to join SocialTask Hub. It's a win-win for everyone involved!",
    author: {
      name: "Sarah Johnson",
      role: "Marketing Specialist",
      avatarUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=48&h=48&q=80"
    },
    rating: 5
  },
  {
    content: "Thanks to SocialTask Hub, I've been able to collaborate with brands I never would have connected with otherwise. The platform opened so many doors!",
    author: {
      name: "Jason Miller",
      role: "Lifestyle Influencer",
      avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=48&h=48&q=80"
    },
    rating: 4
  },
  {
    content: "The analytics dashboard gives me insights I can't get anywhere else. It's helped me fine-tune my content strategy and grow my engagement significantly.",
    author: {
      name: "Emily Chang",
      role: "Digital Creator",
      avatarUrl: "https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=48&h=48&q=80"
    },
    rating: 5
  }
];

const RatingStars = ({ rating }: { rating: number }) => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 !== 0;

  return (
    <div className="flex items-center text-amber-400">
      {Array.from({ length: fullStars }).map((_, i) => (
        <Star key={i} fill="currentColor" size={18} />
      ))}
      {hasHalfStar && (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-star-half">
          <path d="M12 17.8 5.8 21 7 14.1 2 9.3l7-1L12 2" />
        </svg>
      )}
      {Array.from({ length: 5 - fullStars - (hasHalfStar ? 1 : 0) }).map((_, i) => (
        <Star key={i + fullStars + (hasHalfStar ? 1 : 0)} size={18} />
      ))}
    </div>
  );
};

const Testimonials = () => {
  // Select just 3 testimonials to show
  const displayedTestimonials = testimonials.slice(0, 3);

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900">What Our Users Say</h2>
          <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">
            Hear from people who have grown their social media presence using SocialTask Hub
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {displayedTestimonials.map((testimonial, index) => (
            <div key={index} className="bg-gray-50 rounded-xl p-8">
              <div className="flex items-center mb-4">
                <RatingStars rating={testimonial.rating} />
              </div>
              
              <p className="text-gray-700 mb-6">
                "{testimonial.content}"
              </p>
              
              <div className="flex items-center">
                <img 
                  src={testimonial.author.avatarUrl} 
                  alt={testimonial.author.name} 
                  className="w-10 h-10 rounded-full"
                />
                <div className="ml-3">
                  <h4 className="text-sm font-semibold text-gray-900">{testimonial.author.name}</h4>
                  <p className="text-xs text-gray-500">{testimonial.author.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
