class FriendsController < ApplicationController
  load_and_authorize_resource :class => "User", :through => :current_user

  def add_friend
    friend = User.find(params[:user])
    request = FriendRequest.new :sender => current_user, :receiver => friend
    respond_to do |format|
      if request.save!
        format.html { redirect_to friends_url, :notice => "Friend request sent" }
        format.json { render :json => request }
      else
        format.html { redirect_to friends_url }
        format.json { render :json => request.errors, :status => :unprocessable_entity }
      end
    end
  end

end
