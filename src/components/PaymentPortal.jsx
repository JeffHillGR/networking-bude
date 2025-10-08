import { useState } from 'react';
import { ArrowLeft, CreditCard, Calendar, Shield, CheckCircle, Crown, Star, Users, X, Tag } from 'lucide-react';

function PaymentPortal() {
  const [activeTab, setActiveTab] = useState('overview');
  const [isYearly, setIsYearly] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(null);

  const currentSubscription = {
    plan: 'Free',
    status: 'active',
    nextBilling: '2025-11-02',
    amount: 0
  };

  const plans = [
    {
      id: 'free',
      name: 'Preview',
      price: 0,
      yearlyPrice: 0,
      features: [
        'Dashboard preview',
        'Connections preview',
        'Events preview',
        'Profile creation'
      ]
    },
    {
      id: 'bude',
      name: 'BudE Plan',
      price: 9.99,
      yearlyPrice: 99.99,
      popular: true,
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
      features: [
        'Everything in BudE Plan',
        'Discounts on banner ads',
        'Create BudE groups',
        'Access to BudE merchandise'
      ]
    }
  ];

  const billingHistory = [
    { id: 1, date: '2025-01-15', amount: 9.99, description: 'BudE Plan - Monthly', status: 'paid' },
    { id: 2, date: '2024-12-15', amount: 9.99, description: 'BudE Plan - Monthly', status: 'paid' },
    { id: 3, date: '2024-11-15', amount: 9.99, description: 'BudE Plan - Monthly', status: 'paid' }
  ];

  const handleApplyPromo = () => {
    if (promoCode.toUpperCase() === 'WELCOME20') {
      setAppliedPromo({ code: 'WELCOME20', discount: 20, type: 'percentage' });
    } else {
      alert('Invalid promo code');
    }
  };

  const calculatePrice = (basePrice) => {
    if (!appliedPromo) return basePrice;
    if (appliedPromo.type === 'percentage') {
      return basePrice * (1 - appliedPromo.discount / 100);
    }
    return basePrice - appliedPromo.discount;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-8">
        <div className="flex items-center gap-4 mb-2">
        
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Subscription & Billing</h1>
            <p className="text-gray-600 mt-1">Manage your subscription, payment methods, and billing</p>
          </div>
        </div>
      </div>

      {/* Security Notice */}
      <div className="max-w-6xl mx-auto mb-6">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
          <Shield className="w-5 h-5 text-green-600 mt-0.5" />
          <div>
            <h4 className="font-medium text-green-900">Enterprise-Grade Security</h4>
            <p className="text-sm text-green-700 mt-1">
              Powered by Stripe. Your payment data is encrypted with bank-level security. We never store your card details.
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-6xl mx-auto">
        <div className="flex gap-2 mb-6 border-b border-gray-200">
          {['overview', 'plans', 'payment', 'history'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 font-medium capitalize transition-colors ${
                activeTab === tab
                  ? 'text-[#009900] border-b-2 border-[#009900]'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Current Subscription</h2>
                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                  Active
                </span>
              </div>
              
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-1">{currentSubscription.plan} Plan</h3>
                <p className="text-gray-600">Perfect for getting started with networking</p>
              </div>

              <div className="grid grid-cols-2 gap-6 mb-6">
                <div>
                  <p className="text-sm text-gray-600">Next billing date</p>
                  <p className="font-medium">{currentSubscription.nextBilling}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Amount</p>
                  <p className="font-medium">${currentSubscription.amount}/month</p>
                </div>
              </div>

              <button
                onClick={() => setActiveTab('plans')}
          className="px-6 py-2 bg-[#009900] text-white rounded-lg border-[3px] border-[#D0ED00] hover:bg-[#007700] transition-colors"
              >
                Upgrade Plan
              </button>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <Users className="w-8 h-8 text-blue-600 mb-2" />
                <p className="text-2xl font-bold">147</p>
                <p className="text-sm text-gray-600">Total Connections</p>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-6">
                <Calendar className="w-8 h-8 text-green-600 mb-2" />
                <p className="text-2xl font-bold">23</p>
                <p className="text-sm text-gray-600">Events Attended</p>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-6">
                <CheckCircle className="w-8 h-8 text-purple-600 mb-2" />
                <p className="text-2xl font-bold">94%</p>
                <p className="text-sm text-gray-600">Profile Strength</p>
              </div>
            </div>
          </div>
        )}

        {/* Plans Tab */}
        {activeTab === 'plans' && (
          <div className="space-y-6">
            {/* Billing Toggle */}
            <div className="bg-white rounded-lg shadow-sm p-4 flex items-center justify-center gap-4">
              <button
                onClick={() => setIsYearly(false)}
                className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                 !isYearly ? 'bg-[#009900] text-white border-[3px] border-[#D0ED00]' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setIsYearly(true)}
                className={`px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                  isYearly ? 'bg-[#009900] text-white border-[3px] border-[#D0ED00]' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Yearly
                <span className="px-2 py-0.5 bg-white text-[#009900] rounded-full text-xs font-bold">
                  Save 17%
                </span>
              </button>
            </div>

            {/* Plans Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {plans.map((plan) => (
                <div
                  key={plan.id}
                  className={`bg-white rounded-lg shadow-sm p-6 relative ${
                    plan.popular ? 'border-2 border-[#009900]' : 'border border-gray-200'
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <span className="bg-[#009900] text-white px-4 py-1 rounded-full text-sm font-medium">
                        Most Popular
                      </span>
                    </div>
                  )}

                  <div className="text-center mb-6">
                   {plan.id === 'free' && <Users className="w-12 h-12 mx-auto mb-4 text-gray-600" />}
{plan.id === 'bude' && (
  <img 
    src="https://raw.githubusercontent.com/JeffHillGR/networking-bude/main/public/BudE-favicon.png" 
    alt="BudE Plan" 
    className="w-20 h-20 mx-auto mb-4"
  />
)}
{plan.id === 'bude-plus' && (
  <img 
    src="https://raw.githubusercontent.com/JeffHillGR/networking-bude/main/public/BudE-plus-favicon.png" 
    alt="BudE Plus" 
    className="w-20 h-20 mx-auto mb-4"
  />
)}
                    
                    <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                    <div className="text-3xl font-bold text-gray-900">
                      {plan.price === 0 ? (
                        'Free'
                      ) : (
                        <>
                          ${isYearly ? plan.yearlyPrice : plan.price}
                          <span className="text-lg text-gray-600">/{isYearly ? 'year' : 'month'}</span>
                        </>
                      )}
                    </div>
                    {isYearly && plan.yearlyPrice && plan.price > 0 && (
                      <p className="text-sm text-gray-600 mt-1">
                        Save ${((plan.price * 12) - plan.yearlyPrice).toFixed(2)} per year
                      </p>
                    )}
                  </div>

                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() => {
                      setSelectedPlan(plan);
                      setActiveTab('payment');
                    }}
                    className={`w-full py-2 rounded-lg font-medium transition-colors ${
                      plan.id === 'free'
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-[#009900] text-white border-[3px] border-[#D0ED00] hover:bg-[#007700]'
                    }`}
                    disabled={plan.id === 'free'}
                  >
                    {plan.id === 'free' ? 'Current Plan' : 'Select Plan'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Payment Tab */}
        {activeTab === 'payment' && (
          <div className="space-y-6">
            {selectedPlan ? (
              <>
                {/* Order Summary */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="text-xl font-bold mb-4">Order Summary</h2>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>{selectedPlan.name} ({isYearly ? 'Yearly' : 'Monthly'})</span>
                      <span>${isYearly ? selectedPlan.yearlyPrice : selectedPlan.price}</span>
                    </div>
                    {appliedPromo && (
                      <div className="flex justify-between text-green-600">
                        <span>Discount ({appliedPromo.code})</span>
                        <span>-{appliedPromo.discount}%</span>
                      </div>
                    )}
                    <div className="border-t pt-3 flex justify-between font-bold text-lg">
                      <span>Total</span>
                      <span>${calculatePrice(isYearly ? selectedPlan.yearlyPrice : selectedPlan.price).toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Promo Code */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Tag className="w-5 h-5" />
                    Promo Code
                  </h2>
                  {!appliedPromo ? (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                        placeholder="Enter promo code"
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#009900] focus:border-transparent"
                      />
                      <button
                        onClick={handleApplyPromo}
                        className="px-6 py-2 bg-[#009900] text-white rounded-lg border-[3px] border-[#D0ED00] hover:bg-[#007700] transition-colors"
                      >
                        Apply
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between bg-green-50 p-4 rounded-lg">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <div>
                          <p className="font-medium text-green-900">{appliedPromo.code} Applied</p>
                          <p className="text-sm text-green-700">{appliedPromo.discount}% discount</p>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setAppliedPromo(null);
                          setPromoCode('');
                        }}
                        className="text-green-600 hover:text-green-700"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Payment Form */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <CreditCard className="w-5 h-5" />
                    Payment Information
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Card Number
                      </label>
                      <input
                        type="text"
                        placeholder="1234 5678 9012 3456"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#009900] focus:border-transparent"
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Month
                        </label>
                        <input
                          type="text"
                          placeholder="MM"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#009900] focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Year
                        </label>
                        <input
                          type="text"
                          placeholder="YYYY"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#009900] focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          CVV
                        </label>
                        <input
                          type="text"
                          placeholder="123"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#009900] focus:border-transparent"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Cardholder Name
                      </label>
                      <input
                        type="text"
                        placeholder="John Doe"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#009900] focus:border-transparent"
                      />
                    </div>

                    <div className="flex items-center gap-2 bg-gray-50 p-3 rounded-lg">
                      <Shield className="w-4 h-4 text-gray-600" />
                      <span className="text-sm text-gray-600">Your payment information is encrypted and secure</span>
                    </div>

                    <button className="w-full py-3 bg-[#009900] text-white rounded-lg border-[3px] border-[#D0ED00] font-medium hover:bg-[#007700] transition-colors">
                      Complete Payment
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                <p className="text-gray-600 mb-4">Please select a plan to continue with payment.</p>
                <button
                  onClick={() => setActiveTab('plans')}
                  className="px-6 py-2 bg-[#009900] text-white rounded-lg border-[3px] border-[#D0ED00] hover:bg-[#007700] transition-colors"
                >
                  View Plans
                </button>
              </div>
            )}
          </div>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-bold mb-4">Billing History</h2>
            <div className="space-y-3">
              {billingHistory.map((item) => (
                <div key={item.id} className="flex items-center justify-between px-6 py-4 bg-white rounded-lg border-2 border-[#D0ED00]">
                  <div>
                    <p className="font-medium text-gray-900">{item.description}</p>
                    <p className="text-sm text-gray-600">{item.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">${item.amount}</p>
                    <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full">
                      {item.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default PaymentPortal;