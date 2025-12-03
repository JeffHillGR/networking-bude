import { useState } from 'react';
import { ArrowLeft, CreditCard, Shield, CheckCircle, X } from 'lucide-react';

function Account({ onBackToDashboard }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [isYearly, setIsYearly] = useState(false);
  const [showCancelChangeModal, setShowCancelChangeModal] = useState(false);
  const [showConfirmCancelModal, setShowConfirmCancelModal] = useState(false);

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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 md:px-6 py-4 md:py-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3 md:gap-0">
            {/* Back to Dashboard Button */}
            <button
              onClick={onBackToDashboard}
              className="flex items-center gap-2 text-[#009900] hover:text-[#007700] font-medium transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Dashboard</span>
            </button>
            {/* Title */}
            <div className="text-center flex-1">
              <div className="inline-block bg-white px-4 md:px-6 py-2 md:py-3 rounded-lg border-2 border-black">
                <h1 className="text-xl md:text-3xl font-bold text-black">Account</h1>
              </div>
              <p className="text-gray-600 text-xs md:text-sm mt-2">Manage your subscription, payment methods, and billing</p>
            </div>
            {/* Spacer for balance - hidden on mobile */}
            <div className="hidden md:block w-[140px]"></div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Tabs */}
        <div className="bg-gray-100 rounded-full p-1 mb-8 flex">
          {['overview', 'plans', 'payment', 'history'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 px-6 py-3 rounded-full font-medium capitalize transition-colors ${
                activeTab === tab
                  ? 'bg-white text-black shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="relative">
            <div className="space-y-6 opacity-30 pointer-events-none">
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

                <div className="flex gap-3">
                  <button
                    disabled
                    className="px-6 py-2 bg-gray-100 text-gray-500 rounded-lg cursor-not-allowed"
                  >
                    Coming Soon
                  </button>
                  <button
                    onClick={() => setShowCancelChangeModal(true)}
                    className="px-6 py-2 bg-white text-gray-700 rounded-lg border-2 border-gray-300 hover:bg-gray-50 transition-colors"
                  >
                    Cancel or Change Plan
                  </button>
                </div>
              </div>
            </div>
            {/* Coming Soon Overlay */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <img
                src="BudE-favicon.png"
                alt="BudE"
                className="w-24 h-24 mb-4"
              />
              <p className="text-2xl font-bold text-gray-700">Coming Soon</p>
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
                      <span className="bg-white border-2 border-[#009900] text-[#009900] px-6 py-1 rounded-full text-sm font-medium whitespace-nowrap">
                        Most Popular
                      </span>
                    </div>
                  )}

                  <div className="text-center mb-6">
                   {plan.id === 'free' && <Users className="w-12 h-12 mx-auto mb-4 text-gray-600" />}
{plan.id === 'bude' && (
  <img
    src="BudE-favicon.png"
    alt="BudE Plan"
    className="w-20 h-20 mx-auto mb-4"
  />
)}
{plan.id === 'bude-plus' && (
  <img
    src="BudE-plus-favicon.png"
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
                    disabled
                    className="w-full py-2 rounded-lg font-medium transition-colors bg-gray-100 text-gray-500 cursor-not-allowed"
                  >
                    {plan.id === 'free' ? 'Current Plan' : 'Coming Soon'}
                  </button>
                  {plan.id === 'bude' && (
                    <p className="text-xs text-center text-gray-600 mt-3">
                      You currently have free access to all BudE Plan features during our preview period.
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Payment Tab */}
        {activeTab === 'payment' && (
          <div className="relative">
            <div className="space-y-6 opacity-30 pointer-events-none">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Payment Method
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Card Number
                    </label>
                    <input
                      type="text"
                      placeholder="1234 5678 9012 3456"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      disabled
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
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        disabled
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Year
                      </label>
                      <input
                        type="text"
                        placeholder="YYYY"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        disabled
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        CVV
                      </label>
                      <input
                        type="text"
                        placeholder="123"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        disabled
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
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      disabled
                    />
                  </div>
                  <div className="flex items-center gap-2 bg-gray-50 p-3 rounded-lg">
                    <Shield className="w-4 h-4 text-gray-600" />
                    <span className="text-sm text-gray-600">Your payment information is encrypted and secure</span>
                  </div>
                </div>
              </div>
            </div>
            {/* Coming Soon Overlay */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <img
                src="BudE-favicon.png"
                alt="BudE"
                className="w-24 h-24 mb-4"
              />
              <p className="text-2xl font-bold text-gray-700">Coming Soon</p>
            </div>
          </div>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <div className="relative">
            <div className="bg-white rounded-lg shadow-sm p-6 opacity-30 pointer-events-none">
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
            {/* Coming Soon Overlay */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <img
                src="BudE-favicon.png"
                alt="BudE"
                className="w-24 h-24 mb-4"
              />
              <p className="text-2xl font-bold text-gray-700">Coming Soon</p>
            </div>
          </div>
        )}
      </div>

      {/* Cancel or Change Plan Modal */}
      {showCancelChangeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setShowCancelChangeModal(false)}>
          <div className="bg-white rounded-lg p-6 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900">Manage Your Plan</h2>
              <button
                onClick={() => setShowCancelChangeModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <p className="text-gray-600 mb-6">Would you like to change your plan or cancel your subscription?</p>
            <div className="space-y-3">
              <button
                onClick={() => {
                  setShowCancelChangeModal(false);
                  setActiveTab('plans');
                }}
                className="w-full py-3 bg-[#009900] text-white rounded-lg border-[3px] border-[#D0ED00] font-medium hover:bg-[#007700] transition-colors"
              >
                Change to a Different Plan
              </button>
              <button
                onClick={() => {
                  setShowCancelChangeModal(false);
                  setShowConfirmCancelModal(true);
                }}
                className="w-full py-3 bg-white text-red-600 rounded-lg border-2 border-red-600 font-medium hover:bg-red-50 transition-colors"
              >
                Cancel My Subscription
              </button>
              <button
                onClick={() => setShowCancelChangeModal(false)}
                className="w-full py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
              >
                Nevermind
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Cancel Modal */}
      {showConfirmCancelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setShowConfirmCancelModal(false)}>
          <div className="bg-white rounded-lg p-6 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-red-600">Confirm Cancellation</h2>
              <button
                onClick={() => setShowConfirmCancelModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <p className="text-gray-600 mb-4">Are you sure you want to cancel your subscription?</p>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-yellow-800">
                <strong>Important:</strong> You will lose access to all premium features at the end of your current billing period.
              </p>
            </div>
            <div className="space-y-3">
              <button
                onClick={() => {
                  setShowConfirmCancelModal(false);
                  alert('Your subscription has been cancelled. You will retain access until the end of your billing period.');
                }}
                className="w-full py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
              >
                Yes, Cancel My Subscription
              </button>
              <button
                onClick={() => setShowConfirmCancelModal(false)}
                className="w-full py-3 bg-[#009900] text-white rounded-lg border-[3px] border-[#D0ED00] font-medium hover:bg-[#007700] transition-colors"
              >
                Keep My Subscription
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Account;
