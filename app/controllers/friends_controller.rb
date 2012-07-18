class FriendsController < ApplicationController
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

end
