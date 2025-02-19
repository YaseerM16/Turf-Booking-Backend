import cron from 'node-cron';
import { Subscription } from '../database/models/Subscription';

cron.schedule('0 0 * * *', async () => {
    console.log('Checking for expired subscriptions...');

    try {
        const currentDate = new Date();

        const expiredSubscriptions = await Subscription.find({
            endDate: { $lt: currentDate },
            status: 'active',
        });

        if (expiredSubscriptions.length > 0) {
            for (const subscription of expiredSubscriptions) {
                await Subscription.deleteOne({ _id: subscription._id });
                console.log(`Subscription with ID ${subscription._id} has expired and been deleted.`);
            }
        } else {
            console.log('No expired subscriptions found.');
        }
    } catch (error) {
        console.error('Error while checking for expired subscriptions:', error);
    }
});
