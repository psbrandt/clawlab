class FriendsController < ApplicationController
  # before_filter :test
  load_and_authorize_resource :class => "User", :through => :current_user

  def add_friend
    friend = User.find(params[:user_id])
    request = FriendRequest.new :sender => current_user, :receiver => friend
    if request.save!
      render :json => request
    else
      render :json => request.errors, :status => :unprocessable_entity
   end
  end

  private

  # def test
  #   @users = current_user.friends
  # end
end
