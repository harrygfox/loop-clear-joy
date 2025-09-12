import { ArrowLeft, Archive, Trash2, Reply, MoreHorizontal, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";

const EmailPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Gmail-style header */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-background">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-muted rounded-full transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <Archive className="h-5 w-5 text-muted-foreground" />
          <Trash2 className="h-5 w-5 text-muted-foreground" />
          <Reply className="h-5 w-5 text-muted-foreground" />
        </div>
        <MoreHorizontal className="h-5 w-5 text-muted-foreground" />
      </div>

      {/* Email content */}
      <div className="p-4">
        {/* Subject line */}
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-medium text-foreground">
            Action Required: 3 days left to confirm your clearing set
          </h1>
          <Star className="h-5 w-5 text-muted-foreground" />
        </div>

        {/* Sender info */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
            <span className="text-primary-foreground font-medium">L</span>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-medium text-foreground">Localloop</span>
              <span className="text-sm text-muted-foreground">45 minutes ago</span>
            </div>
            <span className="text-sm text-muted-foreground">to me</span>
          </div>
          <div className="flex gap-2">
            <Reply className="h-4 w-4 text-muted-foreground" />
            <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
          </div>
        </div>

        {/* Email body */}
        <div className="space-y-4 text-foreground">
          <p>Hi there!</p>
          
          <p>
            Clearing runs every 28 days – and the next cycle is just 3 days away.
          </p>
          
          <p>
            We’ve gathered all the invoices that are eligible for clearing. Now we need your sign-off to make sure the right ones go through. This is your chance to double-check and remove anything you don’t want included.
          </p>
          
          <p className="font-medium">
            Confirming your clearing set today helps protect your business from late payments and keeps cash flowing smoothly. It only takes about 3 minutes.
          </p>

          {/* CTA Button */}
          <div className="py-4">
            <button 
              onClick={() => navigate("/")}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-3 px-6 rounded-md transition-colors"
            >
              Review invoices now
            </button>
          </div>

          <div className="space-y-4 pb-[100px]">
            <p className="font-medium">Clearing through Local Loop means:</p>
            
            <ul className="space-y-2 pl-4">
              <li className="flex items-start gap-2">
                <span className="w-1 h-1 bg-foreground rounded-full mt-2 flex-shrink-0"></span>
                <span>Fewer awkward calls chasing or delaying payments</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1 h-1 bg-foreground rounded-full mt-2 flex-shrink-0"></span>
                <span>A smoother relationship with suppliers and customers</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1 h-1 bg-foreground rounded-full mt-2 flex-shrink-0"></span>
                <span>More headroom to pay those outside the loop when you need to</span>
              </li>
            </ul>

            <p>
              <span className="font-medium">Every invoice you clear helps keep Merseyside SMEs stronger, together.</span> You can revisit and adjust your decisions anytime during the 28-day cycle.
            </p>
          </div>
        </div>


      {/* Bottom action bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-muted/50 border-t border-border p-4">
        <div className="flex justify-center gap-8">
          <Reply className="h-6 w-6 text-muted-foreground" />
          <Archive className="h-6 w-6 text-muted-foreground" />
        </div>
      </div>
    </div>
  );
};

export default EmailPage;