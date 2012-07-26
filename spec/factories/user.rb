FactoryGirl.define do
  factory :user_a, :class => User do
    name "Test User A"
    email "testA@test.com"
    password "secret"
    password_confirmation "secret"
  end

  factory :user_b, :class => User do
    name "Test User B"
    email "test_b@test.com"
    password "secret"
    password_confirmation "secret"
  end

end
    
