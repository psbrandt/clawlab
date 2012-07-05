FactoryGirl.define do
  factory :user do
    name "Test User"
    email "test@test.com"
    password "secret"
    password_confirmation "secret"
  end
end
    
