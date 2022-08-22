import axios from "axios";
import { showAlert } from "./alerts";
import Stripe from "stripe";
const stripe = Stripe(
  "pk_test_51LBCM8SJaYzeSnQdn5Y9seSvjcSxNHjimrk6EyOSVwed9stFjYAKeAalSSQR3sgEZ2ywrHQ3bcwlnTvqHpsb7Sbm00ykCvl7YZ"
);

export const bookTour = async (tourId) => {
  try {
    //1) Get the session from the API(server)
    const session = await axios(
      `http://127.0.0.1:3000/api/v1/bookings/checkout-session/${tourId}`
    );
    console.log(session);
    //2)Create checkout form + charge credit card
    await stripe.redirectToCheckout({
      sessionId: session.data.session.id,
    });
  } catch (err) {
    showAlert("error", err);
  }
};
