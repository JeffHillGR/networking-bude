import { useState } from 'react';
import { CheckCircle, Users, Star, Crown, ArrowRight, ImageIcon } from 'lucide-react';

function Subscription({ onSelectPlan }) {
  const [isYearly, setIsYearly] = useState(false);

  const plans = [
    {
      id: 'free',
      name: 'Preview',
      price: 0,
      yearlyPrice: 0,
      icon: Users,
      features: [
        'Dashboard preview',
        'Connections preview',
        'Events preview',
        'Profile creation'
      ],
      limits: {
        connections: 'Preview only',
        events: 'Preview only',
        messaging: 'Basic'
      }
    },
    {
      id: 'bude',
      name: 'BudE',
      price: 9.99,
      yearlyPrice: 99.99,
      popular: true,
      icon: 'https://github.com/JeffHillGR/networking-bude/blob/main-fixed/public/BudE-favicon.png?raw=true',
      features: [
        'Unlimited connections',
        'Unlimited event access',
        'Connection insights and analytics',
        'Messaging between BudE\'s',
        'Event notifications (weekly)',
        'New content notifications (weekly)',
        'Profile verification'
      ]
    },
    {
      id: 'bude-plus',
      name: 'BudE+',
      price: 19.99,
      yearlyPrice: 199.00,
      icon: Crown,
      features: [
        'Everything in BudE Plan',
        'Discounts on banner ads',
        'Ability to create BudE groups of networking connections',
        'Access to BudE merchandise including BudE lapel pins to wear to events'
      ]
    }
  ];

  const handleSelectPlan = (planId) => {
    if (onSelectPlan) {
      onSelectPlan(planId, isYearly);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Choose Your Plan
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Upgrade to unlock powerful networking features and grow your professional connections
          </p>
        </div>

        {/* Billing Toggle */}
        <div className="flex items-center justify-center mb-12">
          <div className="bg-white rounded-lg shadow-sm p-2 inline-flex items-center gap-2">
            <button
              onClick={() => setIsYearly(false)}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                !isYearly 
                  ? 'bg-[#009900] text-white' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setIsYearly(true)}
              className={`px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                isYearly 
                  ? 'bg-[#009900] text-white' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Yearly
              <span className="px-2 py-1 bg-[#D0ED00] text-gray-900 rounded-full text-xs font-bold">
                Save 17%
              </span>
            </button>
          </div>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan) => {
            const isFreePlan = plan.id === 'free';
            const price = isYearly && plan.yearlyPrice ? plan.yearlyPrice : plan.price;
            const savings = isYearly && plan.yearlyPrice ? (plan.price * 12) - plan.yearlyPrice : 0;

            return (
              <div
                key={plan.id}
                className={`bg-white rounded-2xl shadow-lg overflow-hidden relative ${
                  plan.popular ? 'border-2 border-[#009900] transform scale-105' : 'border border-gray-200'
                }`}
              >
                {plan.popular && (
                  <div className="absolute top-0 left-0 right-0 bg-[#009900] text-white text-center py-2 text-sm font-semibold">
                    Most Popular
                  </div>
                )}

                <div className={`p-8 ${plan.popular ? 'pt-14' : ''}`}>
                  {/* Icon/Logo */}
                  <div className="flex justify-center mb-6">
                    {plan.id === 'bude' ? (
                      <div className="w-16 h-16 bg-[#009900] rounded-xl flex items-center justify-center">
                        <span className="text-3xl font-bold text-[#D0ED00]">B</span>
                      </div>
                    ) : plan.id === 'bude-plus' ? (
                      <div className="w-16 h-16 bg-gradient-to-br from-[#009900] to-[#D0ED00] rounded-xl flex items-center justify-center relative">
                        <span className="text-3xl font-bold text-white">B</span>
                        <span className="absolute -top-1 -right-1 text-2xl">+</span>
                      </div>
                    ) : (
    <plan.icon className="w-16 h-16 text-gray-600" />
                    )}
                  </div>

                  {/* Plan Name */}
                  <h3 className="text-2xl font-bold text-gray-900 text-center mb-2">
                    {plan.name}
                  </h3>

                  {/* Price */}
                  <div className="text-center mb-6">
                    {isFreePlan ? (
                      <div className="text-4xl font-bold text-gray-900">Free</div>
                    ) : (
                      <>
                        <div className="text-4xl font-bold text-gray-900">
                          ${price}
                          <span className="text-lg text-gray-600 font-normal">
                            /{isYearly ? 'year' : 'month'}
                          </span>
                        </div>
                        {isYearly && savings > 0 && (
                          <div className="text-sm text-green-600 font-medium mt-1">
                            Save ${savings.toFixed(2)} per year
                          </div>
                        )}
                        {plan.id === 'bude' && (
                          <div className="text-sm text-[#009900] font-semibold mt-2">
                            What You're Seeing Now For Free
                          </div>
                        )}
                      </>
                    )}
                  </div>

                  {/* Features */}
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-[#009900] flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700 text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Usage Limits for Free Plan */}
                  {isFreePlan && plan.limits && (
                    <div className="border-t border-gray-200 pt-6 mb-6">
                      <h4 className="font-semibold text-sm text-gray-900 mb-3">Usage Limits</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Connections:</span>
                          <span className="font-medium text-gray-900">{plan.limits.connections}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Events:</span>
                          <span className="font-medium text-gray-900">{plan.limits.events}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Messaging:</span>
                          <span className="font-medium text-gray-900">{plan.limits.messaging}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* CTA Button - BETA: Disabled for beta launch */}
                  <button
                    disabled
                    className="w-full py-3 px-6 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 bg-gray-100 text-gray-500 cursor-not-allowed"
                  >
                    {isFreePlan ? 'Current Plan' : 'Coming Soon'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* FAQ or Additional Info */}
        <div className="mt-16 text-center">
          <p className="text-gray-600 mb-4">
            All plans include access to our professional networking community
          </p>
          <p className="text-sm text-gray-500">
            Questions? Contact us at support@networkingbude.com
          </p>
        </div>
      </div>
    </div>
  );
}

export default Subscription;