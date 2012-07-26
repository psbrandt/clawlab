require "spec_helper"

describe FriendsController do
  
  before (:each) do
    @user_a = FactoryGirl.create(:user_a)
    @user_b = FactoryGirl.create(:user_b)
  end
  
  describe "GET 'index'" do

    it "should be successful" do
      get :index, :auth_token => @user_a.authentication_token
      response.should be_success
    end
  end
  
end
